<template>
  <div class="relative-position" v-if="success">
    <div id="dynamicFieldComponent">
      <!--Read Only-->
      <div v-if="readOnly">
        <div v-if="infoReadOnly">
          <!--Label-->
          <div class="text-primary">
            <q-icon name="fas fa-circle" size="8px" class="q-mr-xs" />
            {{ fieldLabel }}
          </div>
          <!--Value-->
          <div class="text-caption q-ml-sm text-grey-9"> {{ infoReadOnly }}</div>
        </div>
      </div>
      <!--Field-->
      <div v-else :data-testid="`dynamicField-${field.testId || field.name}`">
        <!--Label-->
        <div class="input-title text-capitalize" v-if="loadField('html') || loadField('multiSelect')">
          {{ fieldLabel }}
        </div>
        <!-- Help btn -->
        <div v-if="helpLoad.load && field.help && field.help.description" :class="helpLoad.class">
          <help-text :title="fieldLabel" :description="field.help.description"
                     :btn-style="`margin:${helpLoad.margin}`" />
        </div>
        <!--Crud-->
        <crud v-model="responseValue" v-bind="fieldProps" :key="field.name" :type="field.props.crudType || 'select'"
              ref="crudComponent" v-if="loadField('crud') || (field.props && field.props.crudData)"
              :class="`q-mb-xs ${field.help ? 'crud-dynamic-field' : ''} ${(field.props && field.props.crudType == 'button-create') ? 'absolute-right' : ''}`" />
        <!--Input-->
        <q-input v-model="responseValue" v-bind="fieldProps" @keyup.enter="$emit('enter')" v-if="loadField('input')"
                 :label="fieldLabel" :class="`${field.help ? 'input-dynamic-field' : ''}`">
          <template v-slot:prepend v-if="fieldProps.icon">
            <q-icon :name="fieldProps.icon" size="18px" />
          </template>
          <template v-slot:append v-if="isFieldPassword">
            <q-icon :name="showPassword ? 'fa-light fa-eye' : 'fa-light fa-eye-slash'" class="cursor-pointer"
                    @click="showPassword = !showPassword" />
          </template>
        </q-input>
        <!--Input Standard-->
        <q-input v-model="responseValue" v-bind="fieldProps" @keyup.enter="$emit('enter')"
                 v-if="loadField('inputStandard')" style="margin-bottom: 20px">
          <template v-slot:prepend v-if="fieldProps.icon">
            <q-icon :name="fieldProps.icon" size="18px" />
          </template>
          <template v-slot:append v-if="isFieldPassword">
            <q-icon :name="showPassword ? 'fa-light fa-eye' : 'fa-light fa-eye-slash'" class="cursor-pointer"
                    @click="showPassword = !showPassword" />
          </template>
        </q-input>
        <!-- Input quantity -->
        <div v-if="loadField('quantity')" class="tw-flex tw-w-full tw-items-center">
          <div>
            <q-btn class="" size="sm" flat round color="primary" icon="fa-solid fa-minus"
                   @click="field.value = responseValue > 0  ? --responseValue: 0" :disable="fieldProps.readonly" />
          </div>
          <div class="tw-w-11/12">
            <q-input v-model="responseValue" v-bind="fieldProps" class="bg-white col-8"></q-input>
          </div>
          <div>
            <q-btn class="" size="sm" flat round color="primary" icon="fa-solid fa-plus"
                   @click="field.value = ++responseValue"
                   :disable="fieldProps.readonly" />
          </div>
        </div>
        <!--Search-->
        <q-input v-model="responseValue" v-bind="fieldProps" @keyup.enter="$emit('enter')" v-if="loadField('search')"
                 :class="`${field.help ? 'search-dynamic-field' : ''}`">
          <template v-slot:append>
            <q-icon v-if="(fieldProps.icon === undefined) || fieldProps.icon"
                    :name="fieldProps.icon || 'fa-duotone fa-magnifying-glass'"
                    size="xs" class="cursor-pointer" @click="$emit('enter')" />
          </template>
        </q-input>
        <!--Date-->
        <q-input
          v-if="loadField('date')"
          v-model="responseValue"
          v-bind="fieldProps.field"
          :label="fieldLabel"
          class="tw-w-full"
          :class="`${field.help ? 'date-dynamic-field' : ''}`">
          <template v-slot:prepend>
            <!-- Quick Navigation Button (Previous Day) -->
            <q-btn
              v-show="field.quickNavigation"
              text-color="primary"
              class="q-mr-sm"
              size="sm"
              unelevated
              round
              icon="fa-regular fa-chevron-left"
              @click="updateDate(false)"
            >
              <q-tooltip anchor="bottom middle" self="top middle">
                {{ $tr('isite.cms.label.previous') }}
              </q-tooltip>
            </q-btn>
            <!--Float calendar-->
            <q-icon v-if="fieldProps.field.icon"
                    :name="fieldProps.field.icon"
                    size="18px"
                    class="cursor-pointer"
                    color="blue-grey">
              <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                <q-date v-model="responseValue" v-bind="fieldProps.slot"
                        @update:modelValue="() => $refs.qDateProxy.hide()" />
              </q-popup-proxy>
            </q-icon>
          </template>
          <template v-slot:append>
            <!-- Quick Navigation Button (Next Day) -->
            <q-btn
              v-show="field.quickNavigation"
              text-color="primary"
              class="q-mr-sm"
              size="sm"
              unelevated
              round
              icon="fa-regular fa-chevron-right"
              @click="updateDate(true)"
            >
              <q-tooltip anchor="bottom middle" self="top middle">
                {{ $tr('isite.cms.label.next') }}
              </q-tooltip>
            </q-btn>
          </template>
        </q-input>
        <!--Hour-->
        <q-input v-if="loadField('hour')"
                 v-model="responseValue"
                 v-bind="fieldProps.field"
                 :label="fieldLabel"
                 :class="`${field.help ? 'hour-dynamic-field' : ''}`">
          <template v-slot:prepend>
            <!--Float Time-->
            <q-icon v-if="fieldProps.field.icon"
                    :name="fieldProps.field.icon"
                    size="18px"
                    class="cursor-pointer"
                    color="blue-grey">
              <q-popup-proxy ref="qTimeProxy" transition-show="scale" transition-hide="scale">
                <q-time v-model="responseValue" v-bind="fieldProps.slot"
                        @update:modelValue="() => $refs.qTimeProxy.hide()" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <!--Full date-->
        <q-input v-if="loadField('fullDate')"
                 v-model="responseValue"
                 v-bind="fieldProps.field"
                 :label="fieldLabel"
                 :class="`${field.help ? 'full-date-dynamic-field' : ''}`">
          <template v-slot:prepend>
            <q-icon name="fa-light fa-calendar-day" class="cursor-pointer" color="blue-grey">
              <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                <q-date v-model="responseValue" v-bind="fieldProps.slot"
                        @update:modelValue="() => $refs.qDateProxy.hide()" />
              </q-popup-proxy>
            </q-icon>
          </template>
          <template v-slot:append>
            <q-icon name="fa-light fa-clock" class="cursor-pointer" color="blue-grey">
              <q-popup-proxy ref="qTimeProxy" transition-show="scale" transition-hide="scale">
                <q-time v-model="responseValue" :format24h="fieldProps.field.format24h"
                        @update:modelValue="() => $refs.qTimeProxy.hide()"
                        v-bind="fieldProps.slot" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <!--Time spent -->
         <timeSpent v-if="loadField('timeSpent')"
                         v-model="responseValue"
                         :fieldProps="fieldProps"
                         :label="fieldLabel"
                         :class="`${field.help ? 'full-date-dynamic-field' : ''}`"
        />
        <!--Date range -->
        <dateRangePicker v-if="loadField('dateRange')"
                         v-model="responseValue"
                         :fieldProps="fieldProps"
                         :label="fieldLabel"
                         :class="`${field.help ? 'full-date-dynamic-field' : ''}`"
        />
        <!--Select-->
        <q-select v-model="responseValue" v-bind="fieldProps" :label="fieldLabel" use-input :options="formatOptions"
                  @update:modelValue="matchTags(field)" v-if="loadField('select')" @filter="filterSelectOptions"
                  @clear="val => field.props.multiple ? responseValue = [] : ''"
                  @input-value="addedNewValue"
                  :class="`${field.help ? 'select-dynamic-field' : ''}`">
          <!--No options slot-->
          <template v-slot:no-option v-if="!fieldProps.hideDropdownIcon">
            <slot name="before-options" />
            <q-item>
              <q-item-section class="text-grey" v-if="field?.loadOptions?.filterByQuery">
                {{ fieldProps.hint }}
              </q-item-section>
              <q-item-section class="text-grey" v-else>
                {{ $tr('isite.cms.message.notFound') }}
              </q-item-section>
            </q-item>
          </template>
          <!--Custom Option-->
          <template v-slot:option="scope" v-if="!fieldProps.hideDropdownIcon">
            <q-item v-bind="scope.itemProps">
              <!--Load checkbos if is multiple-->
              <q-item-section avatar v-if="field.props && field.props.multiple">
                <q-checkbox v-model="responseValue" :val="scope.opt.value" />
              </q-item-section>
              <!--Icon-->
              <q-item-section v-else-if="scope.opt.icon" avatar>
                <q-icon size="20px" :name="scope.opt.icon" class="q-mr-sm" />
              </q-item-section>
              <!--Image-->
              <q-item-section avatar v-if="field.props.imageField">
                <q-avatar>
                  <img
                    :src="getImageField(scope.opt.id)"
                    :style="'height: 24px; width: 24px; border-radius: 50%;'"
                  >
                </q-avatar>
              </q-item-section>
              <!--Labels-->
              <q-item-section>
                <div :class="{'tw-flex': field.props.selectColor }">
                  <div v-if="field.props.selectColor">
                    <div
                      class="
                        tw-h-4
                        tw-w-4
                        tw-rounded-full
                        tw-py-3"
                      :class="badgeColor(field, scope)"
                    />
                  </div>
                  <div :class="{'tw-px-4' : field.props.selectColor }">
                    <q-item-label v-html="scope.opt.label" />
                    <q-item-label style="margin: 0" caption v-if="scope.opt.sublabel">
                      {{ scope.opt.sublabel }}
                    </q-item-label>
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </template>
          <!--Icon-->
          <template v-slot:prepend v-if="fieldProps.icon">
            <q-icon :name="fieldProps.icon" size="18px" :color="fieldProps.color" />
          </template>
          <!-- Before Options -->
          <template v-slot:before-options>
            <slot name="before-options"></slot>
          </template>
          <!-- After Options -->
          <template v-slot:after-options>
            <slot name="after-options"></slot>
          </template>
          <template v-slot:before v-if="selectImg">
            <q-avatar>
              <img :src="selectImg">
            </q-avatar>
          </template>
        </q-select>
        <!--tree select-->
        <q-field v-model="responseValue" v-bind="fieldProps.fieldComponent" v-if="loadField('treeSelect')"
                 :label="fieldLabel"
                 :class="`${field.help ? 'treeselect-dynamic-field' : ''}`">
          <tree-select
            v-model="responseValue"
            v-bind="fieldProps.field"
            :options="formatOptions"
            placeholder=""
            :max-height="200"
            @select="(node, instanceId) => $emit('select', {node, instanceId})"
          >
            <template #option-label="{node}">
              <label>
                <!-- Image -->
                <q-img
                  class="q-mr-xs"
                  v-if="field.props.imageField"
                  :src="getImageField(node.id)"
                  :style="'height: 24px; width: 24px; border-radius: 50%;'"
                />
                {{ node.label }}
              </label>
            </template>
            <!--Before options slot-->
            <template #before-list>
              <slot name="before-options"></slot>
            </template>
          </tree-select>
        </q-field>
        <!--HTML-->
        <q-field v-model="responseValue" v-bind="fieldProps.fieldComponent" v-if="loadField('html')" label=""
                 class="field-no-padding">
          <ck-editor v-model="responseValue" :name="field.name" />
        </q-field>
        <!--multiSelect-->
        <q-field v-model="responseValue" v-if="loadField('multiSelect')" label="" v-bind="fieldProps.fieldComponent">
          <recursive-select v-model="responseValue" class="bg-white full-width" :items="options" />
        </q-field>
        <!--Checkbox-->
        <q-field v-model="responseValue" v-if="loadField('checkbox')" class="field-no-padding"
                 v-bind="fieldProps.fieldComponent" label="">
          <q-item tag="label" dense style="padding: 0">
            <!--checkbox-->
            <q-item-section side style="padding: 0">
              <q-checkbox v-model="responseValue" v-bind="fieldProps.field" label="" />
            </q-item-section>
            <!--Label-->
            <q-item-section v-if="fieldProps.field.label">
              <q-item-label caption>
                <div class="float-right" v-html="fieldProps.field.label"></div>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-field>
        <!--Image-->
        <q-field v-model="responseValue" v-if="loadField('image')" class="field-no-padding" label=""
                 v-bind="fieldProps.fieldComponent">
          <upload-image v-model="responseValue" v-bind="fieldProps.field" />
        </q-field>
        <!--Media-->
        <q-field
          v-model="responseValue"
          v-if="loadField('media') && configModules('main.qmedia.moduleName')"
          label=""
          class="field-no-padding no-border media-dinamyc-field"
          v-bind="fieldProps.fieldComponent"
        >
          <!--<media v-model="responseValue" class="bg-white" v-bind="fieldProps.field" />-->
          <select-media v-model="responseValue" class="bg-white" v-bind="fieldProps.field" @files="field.getFiles" />
        </q-field>
        <!--Manage Permission-->
        <manage-permissions v-model="responseValue" class="tw-mb-5" v-if="loadField('permissions')"
                            @update:modelValue="watchValue" :allow-inherit="field.allowInherit ? true : false"/>
        <!--Manage Settings-->
        <manage-settings v-model="responseValue" class="q-mb-sm" :settings="field.settings"
                         v-if="loadField('settings')" @update:modelValue="watchValue" />
        <!--Schedules form-->
        <div class="round bg-white" v-if="loadField('schedule')">
          <schedules-form v-model="responseValue" @input="watchValue" class="q-mb-sm"
                          @converted="value => $emit('converted', value)" />
        </div>
        <!--input color-->
        <q-input v-model="responseValue" v-bind="fieldProps.field" :label="fieldLabel" v-if="loadField('inputColor')"
                 @click="$refs.qColorProxi.show()" :ref="`inputColor-${fieldKey}`"
                 :class="`${field.help ? 'input-color-dynamic-field' : ''}`">
          <template v-slot:append>
            <!--Icon-->
            <q-icon name="fa-light fa-droplet" class="cursor-pointer" />
            <!--Picker-->
            <q-popup-proxy ref="qColorProxi" transition-show="scale" transition-hide="scale">
              <q-color v-model="responseValue" />
            </q-popup-proxy>
          </template>
        </q-input>
        <!--Toggle-->
        <q-toggle v-model="responseValue" v-bind="fieldProps.field" :label="fieldLabel" v-if="loadField('toggle')" />
        <!--position Marker (MAP)-->
        <q-field v-model="responseValue" v-bind="fieldProps.fieldComponent" v-if="loadField('positionMarkerMap')"
                 label=""
                 class="field-no-padding no-border">
          <map-leaflet v-model="responseValue" type="positionMarkerMap" v-bind="fieldProps.field" />
        </q-field>
        <!--Signature-->
        <q-field v-model="responseValue" v-if="loadField('signature')"
                 v-bind="fieldProps.fieldComponent" stack-label label="">
          <signature v-model="responseValue" v-bind="fieldProps.field" />
        </q-field>
        <!--Uploader-->
        <q-field v-model="responseValue" v-if="loadField('uploader')" v-bind="fieldProps.fieldComponent" stack-label>
          <uploader v-model="responseValue" v-bind="fieldProps.field" />
        </q-field>
        <!--rating-->
        <q-field v-model="responseValue" v-if="loadField('rating')" v-bind="fieldProps.fieldComponent">
          <q-rating v-model="responseValue" v-bind="fieldProps.field" class="q-mt-sm" />
        </q-field>
        <!--icon select-->
        <select-icon v-model="responseValue" v-if="loadField('selectIcon')" v-bind="fieldProps" class="q-mb-md"
                     :class="`${field.help ? 'select-icon-dinamyc-field' : ''}`" />
        <!--optionGroup-->
        <q-field v-model="responseValue" v-if="loadField('optionGroup')" v-bind="fieldProps.fieldComponent">
          <q-option-group class="q-pt-md" v-model="responseValue" v-bind="fieldProps.field" />
        </q-field>
        <!--captcha-->
        <q-field v-model="responseValue" v-if="loadField('captcha')" v-bind="fieldProps.fieldComponent">
          <captcha v-model="responseValue" @input="responseValue = $event" />
        </q-field>
        <!--Schedulable-->
        <div class="round bg-white" v-if="loadField('schedulable')">
          <schedulable v-model="responseValue" v-bind="fieldProps" @input="watchValue" class="q-mb-sm" />
        </div>
        <!--Json Editor-->
        <div v-if="loadField('json')" class="field-no-padding no-border code-dinamyc-field" label="">
          <div class="full-width">
            <div class="text-grey-8 q-mb-xs" v-if="fieldProps.field.label">
              {{ fieldProps.field.label }}
            </div>
            <json-editor-vue class="jsoneditor-vue" v-model="responseValue" mode="tree" />
          </div>
        </div>
        <!--Text Info-->
        <div
          v-if="loadField('banner')"
          class='
            tw-flex
            tw-flex-col
            tw-items-end
            tw-mb-4
          '
        >
          <div
            class='
              tw-border
              tw-border-solid
              tw-rounded-xl
              tw-w-full
              tw-p-3.5
            '
            :style="{
              borderColor: fieldProps.colorValue,
              backgroundColor: `${fieldProps.colorValue}1A`
            }"
          >
            <!--content-->
            <div
              class='tw-flex tw-items-center'
              :class="{
                'tw-mb-2': fieldProps.actions.length > 0
              }"
            >
              <!--Icon-->
              <q-icon
                v-if="fieldProps.icon"
                :name="fieldProps.icon"
                :color="fieldProps.color || 'info'"
                size="26px"
              />
              <!--message-->
              <p class='tw-ml-3.5' v-html="fieldProps.message" />
            </div>
          </div>
          <!--Actions-->
          <q-btn
            class='tw--mt-4 tw-mr-5'
            v-for="(btn, keyBtn) in fieldProps.actions"
            :key="keyBtn" v-bind="btn.props"
            @click="btn.action ? btn.action() : null"
          />
        </div>
        <!-- Expression -->
        <expressionField
          v-if="loadField('expression')"
          v-model="responseValue"
          :fieldProps="fieldProps"
          :options="formatOptions"
          :class="`${field.help ? 'expression-dinamyc-field' : ''}`"
        />
        <localizedPhone
          v-if="loadField('localizedPhone') && configModules('main.qlocations.moduleName')"
          v-model="responseValue"
          :fieldProps="fieldProps"
        />

        <multipleDynamicFields
          v-if="loadField('multiplier')"
          v-model="responseValue"
          :fieldProps="fieldProps"
        />

        <!--copy-->
        <q-input v-model="responseValue" v-if="loadField('copy')" v-bind="fieldProps"
                 :ref="`copy-${fieldKey}`" :label="fieldLabel"
                 :class="`${field.help ? 'copy-dynamic-field' : ''}`"
        >
          <template v-slot:append>
            <!--Copy button-->
            <q-btn
              :label="$trp('isite.cms.label.copy')"
              flat
              no-caps
              @click="$helper.copyToClipboard(responseValue)"
              color="primary"
            />
          </template>
        </q-input>
      </div>
    </div>
  </div>
</template>
<script>
//Plugins
import { colors } from 'quasar';
//Component
import recursiveSelect from 'modules/qsite/_components/master/recursiveListSelect';
import managePermissions from 'modules/qsite/_components/master/managePermissions';
import manageSettings from 'modules/qsite/_components/master/manageSettings';
import media from 'modules/qmedia/_components/form';
import uploadImage from 'modules/qsite/_components/master/uploadImage';
import schedulesForm from 'modules/qsite/_components/master/schedules';
import ckEditor from 'modules/qsite/_components/master/ckEditor';
import mapLeaflet from 'modules/qsite/_components/master/mapLeaflet';
import signature from 'modules/qsite/_components/master/signature';
import uploader from 'modules/qsite/_components/master/uploader';
import selectIcon from 'modules/qsite/_components/master/selectIcon';
import captcha from 'modules/qsite/_components/master/captcha';
import schedulable from 'modules/qsite/_components/master/schedulable';
import selectMedia from 'modules/qmedia/_components/selectMedia';
import googleMapMarker from 'modules/qsite/_components/master/googleMapMarker';
import JsonEditorVue from 'json-editor-vue';
import expressionField from 'modules/qsite/_components/master/expressionField/index.vue';
import localizedPhone from 'modules/qsite/_components/master/localizedPhone/index.vue';
import multipleDynamicFields from 'modules/qsite/_components/master/multipleDynamicFields/views';
import dateRangePicker from 'modules/qsite/_components/master/dateRangePicker';
import timeSpent from 'modules/qsite/_components/master/timeSpent';
import { eventBus } from 'src/plugins/utils';

export default {
  name: 'dynamicField',
  beforeUnmount() {
    //Close listen event

  },
  props: {
    modelValue: { default: null },
    field: { default: false },
    language: { default: false },
    itemId: { default: '' },
    readOnly: { type: Boolean, default: false },
    keyField: {
      type: String,
      default: () => ''
    },
    enableCache: { default: false }
  },
  emits: ['update:modelValue', 'inputReadOnly', 'filter', 'select', 'enter', 'converted'],
  components: {
    managePermissions,
    manageSettings,
    recursiveSelect,
    media,
    uploadImage,
    schedulesForm,
    ckEditor,
    mapLeaflet,
    signature,
    uploader,
    selectIcon,
    captcha,
    schedulable,
    selectMedia,
    googleMapMarker,
    JsonEditorVue,
    expressionField,
    localizedPhone,
    multipleDynamicFields,
    dateRangePicker,
    timeSpent
  },
  watch: {
    modelValue: {
      deep: true,
      handler: function(newValue, oldValue) {
        if (JSON.stringify(newValue) != JSON.stringify(oldValue)) {
          this.setDefaultVModel(newValue);
        }
      }
    },
    responseValue(newValue, oldValue) {
      this.watchValue();
    },
    rootOptions(newValue) {
      this.options = this.rootOptions;
      //Select by default
      if (!this.field.loadOptions?.filterByQuery && this.field.props?.selectByDefault && this.rootOptions.length) {
        if (Array.isArray(this.responseValue) && !this.responseValue.length)
          this.responseValue = [this.rootOptions[0].value];
        else if (!Array.isArray(this.responseValue) && !this.responseValue)
          this.responseValue = this.rootOptions[0].value;
      }
      setTimeout(() => this.watchValue(), 500);
    },
    'field.props.options'(newValue, oldValue) {
      if (JSON.stringify(newValue) != JSON.stringify(oldValue))
        this.getOptions();
    },
    'field.loadOptions': {
      deep: true,
      handler: function(newValue, oldValue) {
        if (JSON.stringify(newValue) != JSON.stringify(oldValue))
          this.getOptions();
      }
    }
  },
  mounted() {
    this.$nextTick(function() {
      this.init();
    });
  },
  data() {
    return {
      success: false,//global component status
      loading: false,
      fieldKey: this.$uid(),
      responseValue: null,//value to response
      showPassword: false,//to show password,
      options: [],//Options
      rootOptions: [],//Options
      rootOptionsData: [],//Options
      editorText: {
        toolbar: [
          ['bold', 'italic', 'strike', 'underline', 'removeFormat'],
          ['link'],
          [
            {
              label: 'Font Size',
              icon: 'format_size',
              fixedLabel: true,
              fixedIcon: true,
              list: 'no-icons',
              options: ['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7']
            }
          ],
          ['quote', 'unordered', 'ordered'],
          ['fullscreen']
        ]
      },
      sortOptions: true,
      imageFields: []
    };
  },
  computed: {
    selectImg() {
      const data = this.rootOptions.find(item => item.id == this.responseValue) || {};

      return data.img || null;
    },
    //Return label to field
    fieldLabel() {
      let response = '';
      if (this.field.props && this.field.props.label) {
        response = this.field.props.label;
        if (this.field.isTranslatable) response = `${response} (${this.language})`;
      } else if (this.field.type == 'search') {
        return `${this.$tr('isite.cms.label.search', { capitalize: true })}...`;
      } else if (['date', 'fullDate'].includes(this.field.type)) {
        return `${this.$tr('isite.cms.label.date')}`;
      } else if (this.field.type == 'hour')
        return `${this.$tr('isite.cms.label.hour')}`;

      //Set tree data
      if (this.field.type == 'treeSelect' && this.responseValue && !Array.isArray(this.responseValue)) {
        if (this.rootOptionsData && this.rootOptionsData.length) {
          let infoSelected = this.$array.parents(this.rootOptionsData, this.responseValue);
          if (infoSelected) response += ` | ${infoSelected.parents}`;
        }
      }

      return response;
    },
    //Return field props
    fieldProps() {
      //Default props
      let props = { ...this.field.props || {} }

      //Add ruler to required field
      if (this.field.required) {
        let requireRule = val => !!val || this.$tr('isite.cms.message.fieldRequired')
        if (this.field.type == 'media') {
          const zone = props.zone
          if(props.multiple || props.zone == 'gallery') requireRule = val => val[zone]?.orders.length || this.$tr('isite.cms.message.fieldRequired')
          else requireRule = val => !!val[zone] || this.$tr('isite.cms.message.fieldRequired')
        }
        if (!props.rules) props.rules = []
        props.rules.push(requireRule)
      }

      //Case per type field
      switch (this.field.type) {
        case'crud':
          props = { ...props };
          break;
        case'input':
          props = {
            bgColor: 'white',
            outlined: true,
            dense: true,
            ...props
          };

          //Add rule to validate field
          if (this.field.validateField && this.field.validateField.apiRoute) {
            props.rules = [...(props.rules || []), this.validateField];//Add rule to validate field
          }
          props.debounce = '500'; //Add debounce
          //Extra logic to input type password
          if (this.isFieldPassword) props.type = this.showPassword ? 'text' : 'password';

          break;
        case'inputStandard':
          props = {
            bgColor: 'white',
            outlined: true,
            dense: true,
            ...props
          };

          //Add rule to validate field
          if (this.field.validateField && this.field.validateField.apiRoute) {
            props.rules = [...(props.rules || []), this.validateField];//Add rule to validate field
          }
          props.debounce = '500'; //Add debounce

          //Extra logic to input type password
          if (this.isFieldPassword) props.type = this.showPassword ? 'text' : 'password';

          break;
        case'quantity':
          props = {
            bgColor: 'white',
            outlined: true,
            dense: true,
            ...props
          };
          break;
        case'search':
          props = {
            bgColor: 'white',
            debounce: '800',
            outlined: true,
            dense: true,
            clearable: true,
            label: this.fieldLabel,
            ...props
          };
          break;
        case'date':
          //Instance the mask
          const maskDate = props.mask || 'YYYY/MM/DD';

          props = {
            field: {
              bgColor: 'white',
              color: 'primary',
              outlined: true,
              dense: true,
              icon: 'fa-light fa-calendar-days',
              placeHolder: maskDate,
              hint: `${this.$tr('isite.cms.label.format')}: ${maskDate}`,
              ...props,
              mask: maskDate.replace(/[a-z,A-Z]/g, '#'),
              rules: [
                ...(props.rules || []),
                val => {
                  if (!val) return true;
                  return this.$moment(val, maskDate, true).isValid() || `${this.$tr('isite.cms.message.invalidFormat')} (${maskDate})`;
                }
              ]
            },
            slot: {
              ...props,
              mask: maskDate
            }
          };
          break;
        case'dateRange':
          //Instance the mask
          const maskDateRange = props?.mask ? `${props.mask} - ${props.mask}` : 'YYYY/MM/DD - YYYY/MM/DD';

          props = {
            field: {
              bgColor: 'white',
              clearable: props?.clearable || true,
              color: 'primary',
              outlined: true,
              dense: true,
              icon: 'fa-light fa-calendar-range',
              placeHolder: maskDateRange,
              hint: `${this.$tr('isite.cms.label.format')}: ${maskDateRange}`,
              ...props,
              mask: maskDateRange.replace(/[a-z,A-Z]/g, '#'),
              rules: [
                ...(props.rules || []),
                val => {
                  if (!val) return true;
                  return this.$moment(val, maskDateRange, true).isValid() || `${this.$tr('isite.cms.message.invalidFormat')} (${maskDateRange})`;
                }
              ]
            },
            slot: {
              ...props,
              mask: maskDateRange,
              field: props?.field || null,
              startOfDay: props?.startOfDay ?? '00:00:00',
              endOfDay: props?.endOfDay ?? '23:59:59'
            }
          };
          break;
        case'timeSpent':
          //Instance the mask
          const maskTimeSpent = '2w 4d 6h 45m'
          const regexTimeSpent = /^(\d+[wdhm]\s*)+\s*$/; //numbers and wdhm
          props = {
            field: {
              unit: props?.unit || 'minutes',
              bgColor: 'white',
              clearable: props?.clearable || true,
              color: 'primary',
              outlined: true,
              dense: true,
              icon: 'fa-light fa-timer',
              //placeHolder: '2w 4d 6h 45m',
              regex: regexTimeSpent,
              hint: `${this.$tr('isite.cms.label.format')}: ${maskTimeSpent}`,
              ...props,
              rules: [
                ...(props.rules || []),
                val => {
                  if (!val) return true;
                  return regexTimeSpent.test(val) || `${this.$tr('isite.cms.message.invalidFormat')} (${maskTimeSpent})`;
                }
              ]
              
            },
            slot: {
              ...props,
              field: props?.field || null
            }
          };
          break;
          
        case'hour':
          //Instance the mask
          const maskHour = 'HH:mm';

          props = {
            field: {
              bgColor: 'white',
              color: 'primary',
              outlined: true,
              dense: true,
              icon: 'fa-light fa-clock',
              placeHolder: maskHour,
              hint: `${this.$tr('isite.cms.label.format')}: ${maskHour}`,
              ...props,
              mask: maskHour.replace(/[a-z,A-Z]/g, '#'),
              rules: [
                ...(props.rules || []),
                val => {
                  if (!val) return true;
                  return this.$moment(val, maskHour, true).isValid() || `${this.$tr('isite.cms.message.invalidFormat')} (${maskHour})`;
                }
              ]
            },
            slot: {
              format24h: false,
              ...props
            }
          };
          break;
        case'fullDate':
          //Instance the mask
          const maskFullDate = props.mask || 'YYYY/MM/DD HH:mm';

          props = {
            field: {
              bgColor: 'white',
              color: 'primary',
              outlined: true,
              dense: true,
              placeHolder: maskFullDate,
              hint: `${this.$tr('isite.cms.label.format')}: ${maskFullDate}`,
              ...props,
              mask: maskFullDate.replace(/[a-z,A-Z]/g, '#'),
              rules: [
                ...(props.rules || []),
                val => {
                  if (!val) return true;
                  return this.$moment(val, maskFullDate, true).isValid() || `${this.$tr('isite.cms.message.invalidFormat')} (${maskFullDate})`;
                }
              ]
            },
            slot: {
              mask: maskFullDate,
              ...props
            }
          };
          break;
        case'select':
          props = {
            'emit-value': props?.emitValue ?? true,
            'map-options': true,
            'outlined': true,
            'dense': true,
            'bg-color': 'white',
            'dropdown-icon': 'fa-solid fa-caret-down',
            //style: 'width: 100%',
            behavior: 'menu',
            class: 'q-pb-md custom-btn',
            ...props,
            loading: props.loading || this.loading
          };

          //add default hints
          let hintValue = props.hint ? [props.hint] : [];
          //add hint to UX when use chips
          if (props.multiple && props.useChips && props.hideDropdownIcon)
            hintValue.push(this.$tr('isite.cms.message.hintUseChips'));
          //add hint to UX when filterBySearch
          if (this.field.loadOptions?.filterByQuery)
            hintValue.push(this.$tr('isite.cms.message.hintFilterByQuery'));
          //Set hint
          props.hint = hintValue.join(' - ');

          break;
        case'treeSelect':
          props = {
            'emit-value': true,
            field: {
              clearable: props?.clearable || false,
              multiple: props?.multiple || false,
              sortValueBy: props?.sortValueBy || 'INDEX'
            },
            fieldComponent: {
              outlined: true,
              dense: true,
              ...props,
              clearable: false,
              loading: props.loading || this.loading
            }
          };
          break;
        case'html':
          props = {
            field: {
              toolbar: this.editorText.toolbar,
              contentClass: 'text-grey-9',
              toolbarTextColor: 'grey-9',
              ...props
            },
            fieldComponent: {
              outlined: true,
              dense: true,
              ...props
            }
          };
          break;
        case'multiSelect':
          props = {
            field: {
              ...props
            },
            fieldComponent: {
              outlined: true,
              dense: true,
              ...props
            }
          };
          break;
        case'checkbox':
          props = {
            field: {
              trueValue: 1,
              falseValue: 0,
              ...props
            },
            fieldComponent: {
              dense: true,
              borderless: true,
              ...props
            }
          };
          break;
        case'image':
          props = {
            field: {
              ...props
            },
            fieldComponent: {
              outlined: true,
              dense: true,
              ...props
            }
          };
          break;
        case'media':
          props = {
            field: {
              multiple: (this.field.props.zone == 'gallery') ? true : false,
              ...props,
              entityId: this.$clone(this.itemId)
            },
            fieldComponent: {
              borderless: true,
              dense: true,
              tag: 'div',
              ...props
            }
          };
          break;
        case'permissions':
          props = {
            ...props
          };
          break;
        case'settings':
          props = {
            ...props
          };
          break;
        case'inputColor':
          //Instance color
          let bgColor = this.responseValue || '#FFFFFF';
          let textColorClass = this.$helper.pickTextColor(bgColor) == '#000000' ? 'text-t-dark' : 'text-t-light';

          //Set bg color to input
          setTimeout(() => {
            let inputElement = this.$refs[`inputColor-${this.fieldKey}`];

            //Set input bg color
            if (inputElement) {
              let fieldControl = inputElement.$el.getElementsByClassName('q-field__control')[0];
              fieldControl.style.setProperty('background-color', bgColor, 'important');
            }
          }, 200);

          props = {
            field: {
              bgColor: 'white',
              outlined: true,
              dense: true,
              readonly: true,
              class: `dynamic-field__color q-mb-md ${textColorClass}`,
              ...props
            },
            slot: {
              ...props
            }
          };
          break;
        case'toggle':
          props = {
            field: {
              falseValue: '0',
              trueValue: '1',
              ...props
            }
          };
          break;
        case'positionMarkerMap':
          props = {
            field: {
              ...props
            },
            fieldComponent: {
              borderless: true,
              dense: true,
              ...props
            }
          };
          break;
        case'signature':
          props = {
            field: {
              ...props
            },
            fieldComponent: {
              borderless: true,
              dense: true,
              tag: 'div',
              ...props
            }
          };
          break;
        case'uploader':
          props = {
            field: {
              emitFile: true,
              ...props
            },
            fieldComponent: {
              borderless: true,
              dense: true,
              ...props
            }
          };
          break;
        case'rating':
          props = {
            field: {
              max: 5,
              color: 'amber',
              size: '3em',
              ...props
            },
            fieldComponent: {
              borderless: true,
              dense: true,
              ...props
            }
          };
          break;
        case'selectIcon':
          props = {
            ...props
          };
          break;
        case'optionGroup':
          props = {
            field: {
              options: [],
              color: 'primary',
              ...props
            },
            fieldComponent: {
              outlined: false,
              borderless: true,
              dense: true,
              ...props
            }
          };
          break;
        case'captcha':
          props = {
            field: {
              ...props
            },
            fieldComponent: {
              outlined: false,
              borderless: true,
              dense: true,
              ...props,
              rules: [val => !!val || this.$tr('isite.cms.message.fieldRequired')]
            }
          };
          break;
        case'schedulable':
          props = {
            ...props
          };
          break;
        case'json':
          props = {
            field: {
              ...props,
              mode: 'tree'
            },
            fieldComponent: {
              outlined: false,
              borderless: true,
              dense: true,
              ...props
            }
          };
          break;
        case'banner':
          const { getPaletteColor } = colors;
          let color = props.color || 'info';

          props = {
            icon: 'fas fa-info-circle',
            ...props,
            actions: (props.actions || []).map(item => {
              return {
                ...item,
                props: {
                  unelevated: true,
                  rounded: true,
                  padding: 'xs sm',
                  noCaps: true,
                  color: 'info',
                  ...(item.props || [])
                }
              };
            }),
            colorValue: getPaletteColor(color)
          };
          break;
        case'copy':
          props = {
            bgColor: 'white',
            readonly: true,
            outlined: true,
            dense: true,
            inputClass: 'ellipsis',
            ...props
          };
          break;
      }

      //Response
      return props;
    },
    //Return format of datetime
    formatDateTime() {
      let response = '';

      if (this.field.type == 'date') response = 'MMM DD, YYYY';
      if (this.field.type == 'time') response = 'HH:mm a';
      if (this.field.type == 'datetime') response = 'MMM DD, YYYY - HH:mm a';

      return response;
    },
    //Convert value of options to string
    formatOptions() {
      //Convert value/id to string
      const toString = (items) => {
        items.forEach(item => {
          //Convert value and id to string
          if (item.value || item.value >= 0) item.value = item.value.toString();
          if (item.id || item.id >= 0) item.id = item.id.toString();
          if (item.label) item.label = item.label.toString();
          //convert children
          if (item.children) item.children = toString(item.children);
          this.addImageField(item);
        });

        //sort by label
        if (this.sortOptions) {
          items.sort((a, b) => {
            if (a?.label && b?.label) {
              if (a.label.toLowerCase() > b.label.toLowerCase()) return 1;
              if (a.label.toLowerCase() < b.label.toLowerCase()) return -1;
            }
            return 0;
          });
        }

        //response
        return items;
      };
      //Filter the unique options
      var response = toString(this.$clone(this.options));
      //response the unique options
      return [...new Map(response.map(item => [item['value'], item])).values()];
    },
    //Return info fields readOnly
    infoReadOnly() {
      let currenResponse = this.$clone(this.responseValue);
      let response = currenResponse;

      //Function to get value from select
      let valueFromSelect = () => {
        if (currenResponse && (typeof currenResponse == 'object')) {
          response = [];
          currenResponse.forEach(itemValue => {
            let value = this.formatOptions.find(item => item.value == itemValue);
            if (value && value.label) response.push(value.label);
          });
          response = response.length ? response.join(', ') : false;
        } else {
          response = this.formatOptions.find(item => item.value == response);
          response ? response = response.label : false;
        }
      };

      //Swith type response
      if (this.readOnly) {
        switch (this.field.type) {
          case 'select':
            valueFromSelect();
            break;
          case 'treeSelect':
            valueFromSelect();
            break;
          case 'date':
            response = response ? this.$trd(response) : false;
            break;
          case 'hour':
            let date = this.field.withFullDate ? '' : this.$moment().format('Y-MM-DD');
            response = response ? this.$trd(`${date} ${response}`, { type: 'time' }) : '';
            break;
        }
      }

      return response;//Response
    },
    //Crud info
    crudInfo() {
      //Default response
      let response = {};

      //Get crud info
      if (this.field.validateField && this.field.validateField.crudId)
        response = this.$store.state.qcrudComponent.component[this.field.validateField.crudId] || {};

      //Response
      return response;
    },
    //Validate if field is password
    isFieldPassword() {
      let field = this.$clone(this.field);
      return (field.props.type && (field.props.type == 'password')) ? true : false;
    },
    //Help custom class and styles
    helpLoad() {
      let result = { margin: String, class: String, load: false };
      const objectOptions = {
        crud: {
          class: 'absolute-right',
          margin: '1em',
          load: true
        },
        input: {
          class: 'absolute-right',
          margin: '1em',
          load: true
        },
        inputStandard: {
          class: 'absolute-right',
          margin: '1em',
          load: true
        },
        quantity: {
          class: 'absolute-right',
          margin: '1em',
          load: true
        },
        search: {
          class: 'absolute-right',
          margin: '1em',
          load: true
        },
        date: {
          class: 'absolute-right',
          margin: '1em',
          load: true
        },
        hour: {
          class: 'absolute-right',
          margin: '1em',
          load: true
        },
        fullDate: {
          class: 'absolute-right',
          margin: '1em',
          load: true
        },
        timeSpent: {
          class: 'absolute-right',
          margin: '1em',
          load: true
        },
        dateRange: {
          class: 'absolute-right',
          margin: '1em',
          load: true
        },
        select: {
          class: 'absolute-right',
          margin: '1em',
          load: true
        },
        treeSelect: {
          class: 'absolute-right',
          margin: '1em',
          load: true
        },
        html: {
          class: 'absolute-right',
          margin: '3.8em 1.5em',
          load: true
        },
        checkbox: {
          class: 'absolute-left',
          margin: '1em 17em',
          load: true
        },
        media: {
          class: 'absolute-right',
          margin: '2em 18em 0 0',
          load: true
        },
        inputColor: {
          class: 'absolute-right',
          margin: '1em',
          load: true
        },
        toggle: {
          class: 'absolute-left',
          margin: '1.3em 20em',
          load: true
        },
        signature: {
          class: 'absolute-bottom-right',
          margin: '21.5em 12.5em',
          load: true
        },
        rating: {
          class: 'absolute-left',
          margin: '0 9em',
          load: true
        },
        selectIcon: {
          class: 'absolute-right',
          margin: '1em',
          load: true
        },
        optionGroup: {
          class: 'absolute-left',
          margin: '1.3em 16em',
          load: true
        },
        schedulable: {
          class: 'absolute-left',
          margin: '3.6em 12.5em',
          load: true
        },
        json: {
          class: 'absolute-right',
          margin: '3.7em 1em',
          load: true
        },
        expression: {
          class: 'absolute-right',
          margin: '1em',
          load: true
        },
        positionMarkerMap: {
          class: 'absolute-right',
          margin: '1em',
          load: true
        }
      };
      return objectOptions[this.field.type] || result;
    },
    //Settings
    settings() {
      return {
        mapType: this.$getSetting('isite::mapInShow')
      };
    },
    badgeColor() {
      return (field, scope) => {
        return field.props.colorType === 'tailwindcss'
          ? `tw-bg-${scope.opt.color || scope.opt.value}`
          : `bg-${scope.opt.color || scope.opt.value}`;
      };
    }
  },
  methods: {
    //init
    async init() {
      if (this.field.type) {
        this.setDefaultVModel((this.modelValue != undefined) ? this.modelValue : this.field.value);//Set default values by field type
        this.listenEventCrud();//config dynamic component
        this.success = true;//sucess
        //Set options if is type select
        this.setOptions();
      }
    },
    //Set default values by type
    setDefaultVModel(value) {
      let propValue = this.$clone(value);
      switch (this.field.type) {
        case 'crud':
          //Get crudProps
          let crudProps = (this.field.props && this.field.props.crudProps) ? this.field.props.crudProps : {};
          //Validate if select is multiple
          if (crudProps.multiple) {
            this.responseValue = [];
            //Get filter options
            let filterField = (crudProps.config && crudProps.config.options) ?
              crudProps.config.options : { label: 'title', value: 'id' };
            //if value is array, get id option
            if (propValue && Array.isArray(propValue)) {
              propValue.forEach(item => {
                if (item[filterField.value]) this.responseValue.push(item[filterField.value]);
                else this.responseValue.push(item);
              });
            }
          } else this.responseValue = (propValue && propValue.id) ? propValue.id : propValue;
          break;
        case 'input':
          this.responseValue = (propValue != undefined) ? propValue : null;
          break;
        case 'inputStandard':
          this.responseValue = (propValue != undefined) ? propValue : null;
          break;
        case 'quantity':
          this.responseValue = (propValue != undefined) ? propValue : null;
          break;
        case 'html':
          this.responseValue = propValue || '';
          break;
        case 'treeSelect':
          this.orderOptions(propValue);
          break;
        case 'select':
          this.orderOptions(propValue);
          break;
        case 'multiSelect':
          this.responseValue = propValue || [];
          break;
        case 'checkbox':
          this.responseValue = (propValue !== undefined) ? propValue : null;
          break;
        case 'media':
          this.responseValue = propValue || {};
          break;
        case 'permissions':
          this.responseValue = (propValue.length == undefined) ? propValue : {};
          break;
        case 'settings':
          this.responseValue = propValue || {};
          break;
        case 'search':
          this.responseValue = propValue || null;
          break;
        case 'toggle':
          this.responseValue = (propValue || 0).toString();
          break;
        case 'positionMarkerMap':
          this.responseValue = propValue || false;
          break;
        case 'uploader':
          this.responseValue = (propValue !== undefined) ? propValue : null;
          break;
        case 'rating':
          this.responseValue = (propValue !== undefined) ? propValue : 1;
          break;
        case 'selectIcon':
          this.responseValue = (propValue !== undefined) ? propValue : null;
          break;
        case 'optionGroup':
          this.responseValue = (propValue !== undefined) ? propValue : null;
          break;
        case 'captcha':
          this.responseValue = (propValue !== undefined) ? propValue : null;
          break;
        case 'json':
          this.responseValue = (propValue !== undefined) ? propValue : {};
          break;
        case 'multiplier':
          this.responseValue = (Array.isArray(propValue)) ? propValue : [];
          break;
        default :
          this.responseValue = propValue || null;
          break;
      }
    },
    //Order options
    orderOptions(propValue) {
      if (propValue !== undefined) {
        if (Array.isArray(propValue)) {
          this.responseValue = [];
          propValue.forEach(item => {
            if (this.fieldProps['emit-value']) {
              let value = (typeof item == 'object') ? item.id : item;
              this.responseValue.push(value.toString());
            } else {
              this.responseValue.push(item);
            }
          });
        } else {
          this.responseValue = propValue || propValue == 0 ? this.$clone(this.fieldProps['emit-value'] ? propValue.toString() : propValue) : propValue;
        }
      }
    },
    //Config dynamic component
    listenEventCrud() {
      setTimeout(() => {
        if (this.field.create && this.field.create.component) {
          let componentCrud = this.$refs.crudComponent;
          if (componentCrud) {
            //Activate listen to chanel
            eventBus.on(`crudForm${componentCrud.params.apiRoute}Created`, async () => {
              this.getOptions();//Get options
            });
          }
        }
      }, 500);
    },
    //Get options if is load options
    getOptions(query = false) {
      return new Promise((resolve, reject) => {
        this.loading = true;//Open loading
        let loadOptions = this.$clone(this.field.loadOptions || {});
        //Instance default options keeping the options for the selected values
        let defaultOptions = this.$clone([
          ...(this.field.props?.options || []),
          ...this.rootOptions.filter(opt => this.responseValue && this.responseValue.includes((opt.value || opt.id).toString()))
        ]);

        //==== Request options
        if (loadOptions.apiRoute) {
          //Reset options
          this.rootOptions = defaultOptions;
          let fieldSelect = { label: 'title', id: 'id' };

          //enable cache by isite setting
          let enableCache = this.$getSetting('isite::enableDynamicFieldsCache');
          //enable cache by params
          if (this.enableCache) enableCache = 1;

          let params = {//Params to request
            refresh: enableCache == '1' ? false : true,
            params: loadOptions.requestParams || {}
          };

          //add filter
          if (!params.params.filter) params.params.filter = {};
          params.params.filter.allTranslations = true;

          //Add Params to get options by query
          if (loadOptions && loadOptions.filterByQuery) {
            if (query && (query.length >= 2)) {
              params.params.filter.search = query;
              params.params.take = 25;
            } else {
              this.loading = false;
              this.rootOptions = defaultOptions;
              return resolve(false);
            }
          }
          const parametersUrl = Object.keys(loadOptions?.parametersUrl ?? {}).length ? loadOptions.parametersUrl : false;
          const crud = parametersUrl ? this.$crud.get : this.$crud.index;
          //Request
          crud(loadOptions.apiRoute, params, parametersUrl).then(response => {
            if (this.keyField !== '') {
              const keyData = { [this.keyField]: response.data };
              this.$helper.setDynamicSelectList(keyData);
            }
            this.rootOptionsData = this.$clone(response.data);

            //Emit the loadedOptions
            if (loadOptions.loadedOptions) loadOptions.loadedOptions(response.data);

            this.rootOptionsData.forEach(item => {
              this.addImageField(item);
            });

            let formatedOptions = [];
            //Format response
            response.data = response.data.map((item, index) => ({ ...item, id: item.id >= 0 ? item.id : (index + 1) }));
            if (loadOptions.format) formatedOptions = loadOptions.format(response.data);
            else if (['select', 'expression'].includes(this.field.type))
              formatedOptions = this.$array.select(response.data, loadOptions.select || fieldSelect);
            else
              formatedOptions = this.$array.tree(response.data, loadOptions.select || fieldSelect);

            //Assign options
            this.rootOptions = this.$clone(defaultOptions.concat(formatedOptions));
            this.loading = false;
            resolve(true);
          }).catch(error => {
            this.$apiResponse.handleError(error, () => {
              this.$alert.error({ message: this.$tr('isite.cms.message.errorRequest'), pos: 'bottom' });
              this.loading = false;
              reject(true);
            });
          });
          //==== Delayed loading options
        } else if (loadOptions.delayed) {
          loadOptions.delayed().then(response => {
            this.rootOptions = this.$clone([...defaultOptions, ...response]);

            this.loading = false;
            resolve(true);
          }).catch(error => {
            this.loading = false;
            resolve(true);
          });
        } else {
          this.rootOptions = this.$clone(defaultOptions);
          this.loading = false;
          resolve(true);
        }
      });
    },
    //Set options
    async setOptions() {
      if (['treeSelect', 'select', 'multiSelect', 'expression'].includes(this.field.type)) {
        //Instance sortOrder from field props
        if (this.field.props?.sortOptions != undefined) this.sortOptions = this.$clone(this.field.props.sortOptions);
        //Load options
        if (this.field.loadOptions) await this.getOptions();
        //Set options
        else if (this.field.props && this.field.props.options) this.rootOptions = this.field.props.options;
      }
    },
    //Regex to tags
    matchTags(field) {
      if (field.props.useChips && field.matchTags) {
        let tags = [];
        //only letters and spaces
        this.responseValue.forEach((tag, index) => {
          let tagString = tag.trim();//Trim
          tagString = tagString.match(/^[a-zA-Z\-\s]*$/);//Regex
          if (tagString && tagString.length) tags.push(tagString.join(''));
        });
        this.responseValue = this.$clone(tags);
      }
    },
    //Check if value change
    watchValue() {
      let value = this.$clone(this.modelValue);
      let response = this.$clone(this.responseValue);

      if (JSON.stringify(value) !== JSON.stringify(response)) {
        //decode when is json
        if (this.field.type == 'json' && (typeof response == 'string'))
          response = JSON.parse(response);
        //Emit input data
        this.$emit('update:modelValue', response);
      }

      //Load option for value
      this.loadOptionForValue();

      //Emit info read only data
      this.$emit('inputReadOnly', this.$clone({ label: this.fieldLabel, value: this.infoReadOnly }));
    },
    //Validate if show  field
    loadField(name) {
      let response = true;
      let field = this.$clone(this.field);
      //Validate type field
      if (field.type !== name) response = false;
      //Validate permission
      if (field.permission && !this.$hasAccess(field.permission)) response = false;
      //Validate vIf prop
      if (response && field.props && (field.props?.vIf != undefined)) response = field.props?.vIf;
      //Response
      return response;
    },
    //Validate fields
    validateField(val) {
      return new Promise((resolve, reject) => {
        let ruleResponse = true || 'update';//Default rule response
        let crudInfo = this.$store.state.qcrudComponent.component[this.crudId] || {};
        //Request Params
        let requestParams = {
          refresh: true,
          params: this.field.validateField.requestParams || {}
        };
        //Set default filter
        requestParams.params.filter = { field: 'title', ...(requestParams.params.filter || {}) };

        //Request
        this.$crud.show(this.field.validateField.apiRoute, val, requestParams).then(response => {
          if (response.status == 200) {
            //Already exist
            ruleResponse = false || this.$tr('isite.cms.message.fieldAlreadyExist');
            //Validate if compare with crudInfo
            if (this.crudInfo && (this.crudInfo.typeForm == 'update') && (this.crudInfo.id == response.data.id))
              ruleResponse = true || 'update';
          }
          resolve(ruleResponse);
        }).catch(error => {
          this.$apiResponse.handleError(error, () => {
            console.error(error);
            resolve(ruleResponse);
          });
        });
      });
    },
    //filter Select
    async filterSelectOptions(val, update, abort) {
      //Get params
      let loadOptions = this.field.loadOptions;

      //Filter By Query
      if (loadOptions && loadOptions.filterByQuery) {
        await this.getOptions(val);
        update();
      } else {//Filter current options
        update(async () => {
          this.options = this.$helper.filterOptions(val, this.rootOptions, this.responseValue);
        });
      }

      //Hint message for filterByQuery
      if (loadOptions && loadOptions.filterByQuery) {
        if (val.length >= 2) {
          if (!this.rootOptions.length) {
            this.fieldProps.hint = `${this.$tr('isite.cms.message.noResultsFoundTryAnotherSearchValue')}`;
          }
        }
      }

      //Emit filter Value
      this.$emit('filter', val);
    },
    //Load the option for default value when is loadOptions
    loadOptionForValue() {
      if (this.loadField('select')) {
        let loadOptions = this.field.loadOptions;
        if (loadOptions && loadOptions.apiRoute) {
          //Valudate if the response values is not in the root options
          let responseValueTmp = (this.responseValue || []);
          responseValueTmp = Array.isArray(responseValueTmp) ? responseValueTmp : [responseValueTmp];
          const includeAll = responseValueTmp.every(val =>
            this.rootOptions.map(val => (val.value || val.id || '').toString()).includes(val.toString())
          );
          //Validate if there is the option for the value
          if (loadOptions.filterByQuery && !includeAll) {
            let fieldSelect = loadOptions.select || { label: 'title', id: 'id', img: 'mainImage' };
            //Instance request params
            let requestParams = {
              refresh: true,
              params: {
                ...(loadOptions.requestParams || {}),
                filter: {
                  ...(loadOptions.requestParams?.filter || {}),
                  [fieldSelect.id]: (this.responseValue.id || this.responseValue.value || this.responseValue)
                }
              }
            };

            //Request
            this.$crud.index(loadOptions.apiRoute, requestParams).then(response => {
              const responseData = response.data;
              if (responseData.length) {
                if (Array.isArray(this.modelValue)) {
                  //Remove value if isn't on response.data
                  const results = this.modelValue.filter((value) => responseData.find((data) => data.id == value)) || null;
                  this.setDefaultVModel(results);
                }
                this.rootOptions = [
                  ...this.rootOptions,
                  ...this.$array.select(responseData, fieldSelect)
                ];
                //Emit the loadedOptions
                if (loadOptions.loadedOptions) loadOptions.loadedOptions(responseData);
              } else {
                //Remove value if isn't on response.data
                this.setDefaultVModel(null);
              }
            }).catch(error => {
              this.$apiResponse.handleError(error, () => {
              });
            });
          }
        }
      }
    },
    addImageField(item) {
      if (this.field.props.imageField) {
        const src = _.get(item, this.field.props.imageField, '');
        this.imageFields.push({ id: item.id, src: src });
      }
    },
    getImageField(id) {
      const item = this.imageFields.find((e) => e.id == id);
      return item.src;
    },
    //Persist Value in input
    addedNewValue(val) {
      const props = this.field?.props ?? {};
      //Only when exist fill-input
      if (props['fill-input']) {
        this.responseValue = val;
      }
    },
    configModules(name) {
      if (!name) return;
      return Boolean(config(name));
    },
    updateDate(isAdd = false) {
      const params = {
        isAdd,
        format: this.fieldProps.slot.mask,
        unit: this.fieldProps.field.navigation?.unit || 'day',
        amount: this.fieldProps.field.navigation?.amount || 1
      };

      if(this.modelValue) this.$emit('update:modelValue', this.$date.calculateNewDate(this.modelValue, params))
    }
  }
};
</script>
<style lang="scss">
#dynamicFieldComponent {
  .custom-btn .q-field__control div:last-child {
    font-size: 16px;
  }

  .q-field--outlined .q-field__control {
    padding-left: 12px;
  }

  .expression-dinamyc-field {
    width: calc(100% - 40px);
  }

  .jsoneditor-vue {
    width: 100%;
    height: 400px;
  }

  .checkbox-field {
    .q-field__control-container {
      padding-top: 0 !important;
    }
  }

  .field-no-padding {
    .q-field__control {
      padding: 0 !important;
      overflow: hidden;
      border-radius: $custom-radius-items;

      .q-field__control-container {
        padding: 0 !important;
      }
    }
  }

  .vue-treeselect {
    .vue-treeselect__control {
      background: transparent !important;
      border: 0;
      max-height: 26px;
      padding-right: 0px;

      .vue-treeselect__single-value {
        line-height: 1.9;
        padding: 0;
      }
    }

    .vue-treeselect__menu-container {
      position: static;
    }

    .vue-treeselect__menu {
      position: relative !important;
    }
  }

  .dynamic-field__color {
    .q-field__control {
      border-radius: $custom-radius-items;
    }

    &.text-t-dark {
      .q-icon, .q-field__label, input {
        color: $dark;
      }
    }

    &.text-t-light {
      .q-icon, .q-field__label, input {
        color: white;
      }
    }
  }

  #ckEditorComponent {
    width: 100%;
  }

  // help padding-right
  .crud-dynamic-field,
  .input-dynamic-field,
  .search-dynamic-field,
  .date-dynamic-field,
  .hour-dynamic-field,
  .full-date-dynamic-field,
  .select-dynamic-field,
  .treeselect-dynamic-field,
  .input-color-dynamic-field,
  .copy-dynamic-field,
  .select-icon-dinamyc-field {
    .q-field__control {
      padding-right: 40px;
    }
  }
}
</style>
